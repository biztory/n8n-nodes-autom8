import type { Icon, ICredentialType, INodeProperties, ICredentialTestRequest } from 'n8n-workflow';

export class Autom8TableauBearerApi implements ICredentialType {
  name = 'autom8TableauBearerApi';
  displayName = 'Autom8 Tableau – Bearer Token API';
  icon: Icon = { light: 'file:../icons/autom8-light.svg', dark: 'file:../icons/autom8-dark.svg' };
  documentationUrl = "https://biztory.atlassian.net/wiki/spaces/A8/pages/1122336771/Authentication";
  // Our test request can not _actually_ verify the credentials, as it is a Bearer token that it will _receive_ as a webhook. What we can do instead, is check that the token (or at least part of it, for "security" is legit according to someone else).
  test: ICredentialTestRequest = {
  request: {
    baseURL: 'https://httpbin.org',
    url: '/bearer',
    method: 'GET',
    headers: {
      Authorization: 'Bearer {{$credentials.token.substring(0, 10)}}',
    },
  },
};
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
