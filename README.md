# n8n-nodes-autom8

This is an n8n community node. It lets you use Biztory's **Autom8** Tableau Extensions in your n8n workflows.

With Autom8, Tableau dashboards can be made actionable seamlessly. Add the Tableau Extension to your dashboard, wire it up with this n8n node, and you're ready to use your dashboard's data in n8n however you wish! There are no limits to how it can be used as of then.

ℹ️ This README contains the primary information needed to work with the Autom8 node. It complements the [full documentation](https://biztory.atlassian.net/wiki/spaces/A8/pages/1123254273/n8n+Node).

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The Autom8 node is a trigger node resembling a webhook. It has no specific operations, as instead it can be used to connect your Tableau dashboard to an n8n workfklow. See [Usage](#usage) for more information on getting started.

## Compatibility

Tested and supported starting with n8n version **2.13.3**.

## Usage

Use the Autom8 node to wire up your Tableau dashboard to an n8n workflow. Do this through the following steps:

1. Start your n8n workflow with an **Autom8 trigger node**.
1. Choose a unique value for **Webhook Path**, identifying your workflow and its purpose e.g. `autom8-sales-data-review` if dealing with data that is going to be reviewed by the sales team.
1. This value determines the **URL for the webhook**. To view it, open the "Webhook URLs section" at the top of the node configuration area, under Parameters.
1. Copy and paste this value into the **Autom8 Extension** in Tableau. Depending on whether you are developing the workflow from scratch or putting it in production, opt for either the Test URL or the Production URL of the webhook.

_New to n8n? [Try it out](https://docs.n8n.io/try-it-out/) to get started and learn the basics._

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Full documentation](https://biztory.atlassian.net/wiki/spaces/A8/pages/1123254273/n8n+Node)
* ⚠️ To do: add link to the Extension on the Tableau Exchange.
