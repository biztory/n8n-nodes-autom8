import {
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  INodeExecutionData,
  IDataObject,
  NodeOperationError,
} from 'n8n-workflow';

// ---------------------------------------------------------------------------
// Dynamic snake_case converter
//
// Strategy, applied in order:
//   1. Strip surrounding parentheses groups: "SUM(Review Score)" → "Review Score"
//   2. Replace any run of non-alphanumeric characters with a single underscore
//   3. Collapse multiple underscores, trim leading/trailing ones
//   4. Lowercase everything
//
// Examples:
//   "Reviewer Email Address"  → "reviewer_email_address"
//   "SUM(Review Score)"       → "sum_review_score"
//   "AGG(Review Criticality)" → "agg_review_criticality"
//   "Product Name"            → "product_name"
//   "  Weird  Key!! "         → "weird_key"
// ---------------------------------------------------------------------------
function toSnakeCase(raw: string): string {
  return raw
    .replace(/[^A-Za-z0-9]+/g, '_')   // non-alphanumeric runs → underscore
    .replace(/^_+|_+$/g, '')           // trim leading/trailing underscores
    .replace(/_+/g, '_')               // collapse consecutive underscores
    .toLowerCase();
}

// ---------------------------------------------------------------------------
// Types matching the expected Tableau webhook payload
// ---------------------------------------------------------------------------
interface TableauRow {
  [key: string]: unknown;
}

interface TableauPayload {
  metadata?: {
    dashboardName?: string;
    timestamp?: string;
    user?: string;
  };
  data: Record<string, TableauRow[]>;
  additional_data?: {
    [key: string]: unknown;
  };
}

// ---------------------------------------------------------------------------
// Node definition
// ---------------------------------------------------------------------------
export class Autom8TableauTrigger implements INodeType {
  description: INodeTypeDescription = {
    // ── Identity ─────────────────────────────────────────────────────────
    displayName: 'Autom8 – Tableau Trigger',
    name: 'autom8TableauTrigger',
    icon: { light: 'file:../../icons/autom8.svg', dark: 'file:../../icons/autom8.svg' },
    group: ['trigger'],
    version: 1,
    description:
      'Receives data from the Autom8 Tableau dashboard extension, and gets it ready for downstream processing.',

    // ── Defaults ──────────────────────────────────────────────────────────
    defaults: {
      name: 'Autom8 – Tableau Trigger',
    },

    // ── Webhook setup ─────────────────────────────────────────────────────
    inputs: [],
    outputs: ['main'],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        isFullPath: true,
        responseMode: '={{$parameter["responseMode"]}}',
        responseData: '={{$parameter["responseData"]}}',
        path: '={{$parameter["path"]}}',
      },
    ],
 
    // ── User-facing parameters ────────────────────────────────────────────
    properties: [
      {
        displayName: 'Webhook Path',
        name: 'path',
        type: 'string',
        default: 'autom8-tableau',
        required: true,
        description:
          'The URL path segment that Tableau will POST to. Must be unique across your n8n instance.',
        placeholder: 'e.g. autom8-customer-satisfaction',
      },
 
      // ── Response mode — mirrors the built-in Webhook node ─────────────
      {
        displayName: 'Respond',
        name: 'responseMode',
        type: 'options',
        options: [
          {
            name: 'Immediately',
            value: 'onReceived',
            description: 'As soon as this node executes',
          },
          {
            name: 'When Last Node Finishes',
            value: 'lastNode',
            description: 'Returns data of the last-executed node. Use a single field `autom8_response` along with Response Data "First Entry JSON" to display a message in Tableau.',
          },
        ],
        default: 'onReceived',
        description: 'When and how to respond to the incoming Tableau request',
      },
 
      // ── Response data — only shown when "When Last Node Finishes" ──────
      {
        displayName: 'Response Data',
        name: 'responseData',
        type: 'options',
        displayOptions: {
          show: {
            responseMode: ['lastNode'],
          },
        },
        options: [
          {
            name: 'All Entries',
            value: 'allEntries',
            description: 'Returns all entries of the last node as an array',
          },
          {
            name: 'First Entry JSON',
            value: 'firstEntryJson',
            description: 'Returns the JSON data of the first entry of the last node',
          },
          {
            name: 'First Entry Binary',
            value: 'firstEntryBinary',
            description: 'Returns the binary data of the first entry of the last node',
          },
          {
            name: 'No Response Body',
            value: 'noData',
            description: 'Returns without a body',
          },
        ],
        default: 'firstEntryJson',
        description: 'What data the webhook should return',
      },
 
      // ── Notice shown when using the Respond to Webhook node ───────────
      {
        displayName:
          "Insert a 'Respond to Webhook' node into your workflow to control the response.",
        name: 'webhookNotice',
        type: 'notice',
        displayOptions: {
          show: {
            responseMode: ['responseNode'],
          },
        },
        default: '',
      },
 
      // ── Autom8-specific options ───────────────────────────────────────
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add option',
        default: {},
        options: [
          {
            displayName: 'Skip Empty Worksheets',
            name: 'skipEmpty',
            type: 'boolean',
            default: true,
            description:
              'Whether to silently drop worksheets that contain no rows.',
          },
          {
            displayName: 'Pass Through Raw Body',
            name: 'passThroughRaw',
            type: 'boolean',
            default: false,
            description:
              'Whether to attach the full, unmodified request body as a `_raw` key on every output item — useful for debugging.',
          },
        ],
      },
    ],
  };
 
  // ── Webhook handler ──────────────────────────────────────────────────────
  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const responseMode = this.getNodeParameter('responseMode', 'onReceived') as string;
    const options = this.getNodeParameter('options', {}) as {
      skipEmpty?: boolean;
      passThroughRaw?: boolean;
    };
 
    const skipEmpty = options.skipEmpty !== false;
    const passThroughRaw = options.passThroughRaw === true;
 
    // ── 1. Parse & validate the incoming body ──────────────────────────────
    let payload: TableauPayload;
    try {
      payload = req.body as TableauPayload;
      if (!payload || typeof payload.data !== 'object') {
        throw new Error('Missing or invalid "data" key in request body.');
      }
    } catch (err) {
      throw new NodeOperationError(
        this.getNode(),
        'Autom8 Tableau Trigger: could not parse request body.',
      );
    }
 
    const includeDiscountCode =
      (payload.additional_data?.include_discount_code as string | undefined)?.toLowerCase() === 'yes';
 
    const rawBody = passThroughRaw ? (payload as unknown as IDataObject) : undefined;
 
    // ── 2. Iterate worksheets ──────────────────────────────────────────────
    const outputItems: INodeExecutionData[] = [];
 
    for (const [worksheetName, worksheetRows] of Object.entries(payload.data)) {
      if (!Array.isArray(worksheetRows)) continue;
      if (skipEmpty && worksheetRows.length === 0) continue;
 
      for (const row of worksheetRows) {
        const shaped: IDataObject = {};
 
        for (const [rawKey, value] of Object.entries(row)) {
          shaped[toSnakeCase(rawKey)] = value as IDataObject;
        }
 
        shaped['worksheet_name'] = toSnakeCase(worksheetName);
        shaped['include_discount_code'] = includeDiscountCode;
 
        if (rawBody) {
          shaped['_raw'] = rawBody;
        }
 
        outputItems.push({ json: shaped });
      }
    }
 
    // ── 3. Return the right shape depending on response mode ───────────────
    // - 'onReceived':   n8n replies immediately; workflowData triggers the workflow.
    // - 'lastNode':     n8n waits for the workflow to finish, sends last node output.
    // - 'responseNode': a downstream "Respond to Webhook" node sends the reply;
    //                   noWebhookResponse: true prevents n8n from auto-responding.
    if (responseMode === 'responseNode') {
      return {
        workflowData: [outputItems],
        noWebhookResponse: true,
      };
    }
    
    return {
      workflowData: [outputItems],
    };
  }
}