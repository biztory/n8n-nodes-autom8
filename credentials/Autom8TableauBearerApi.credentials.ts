import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class Autom8TableauBearerApi implements ICredentialType {
  name = 'autom8TableauBearerApi';
  displayName = 'Autom8 Tableau – Bearer Token';
  icon: Icon = { light: 'file:../../icons/autom8.svg', dark: 'file:../../icons/autom8.svg' };
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
