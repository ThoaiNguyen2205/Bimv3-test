
export type IPropertyValueReqCreate = {
  name?: string;
  value?: string;
}

export type IPropertyValue = {
  _id: string;
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type IPropertyValueResGetAll = {
  data: IPropertyValue[];
  total: {
    count: number;
    _id: string;
  };
}