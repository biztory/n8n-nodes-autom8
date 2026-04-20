import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class Autom8TableauBearerApi implements ICredentialType {
  name = 'autom8TableauBearerApi';
  displayName = 'Autom8 Tableau – Bearer Token API';
  icon: Icon = { light: 'file:../icons/autom8-light.svg', dark: 'file:../icons/autom8-dark.svg' };
  documentationUrl = "https://biztory.atlassian.net/wiki/spaces/A8/pages/1122336771/Authentication";
  properties: INodeProperties[] = [
    {
      displayName: 'Bearer Token',
      name: 'token',
      type: 'string',
      typeOptions: { password: true },
      required: true,
      default: '',
    },
  ];
}
