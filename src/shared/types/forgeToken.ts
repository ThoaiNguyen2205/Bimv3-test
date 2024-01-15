export type IForgeToken = {
  access_token?: string;
  expires_at?: string;
  expires_in?: string;
  token_type?: string;
}

export type IBucket = {
  id: string;
  type: string;
  children: boolean;
}

export type IBucketCreatedRes = {
  statusCode: string;
  body: {
    bucketKey: string;
    bucketOwner: string;
  }
}

export type IForgeModel = {
  id: string;
  type: string;
  text: string;
  children: boolean;
}

export type IForgeManifest = {
  status: string;
  urn: string;
  progress: string;
}