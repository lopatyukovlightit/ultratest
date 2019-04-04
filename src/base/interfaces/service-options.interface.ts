export interface IRelationOption {
  name: string;
  order?: {
    column: string;
    type: 'ASC' | 'DESC';
  };
  subrelation?: IRelationOption;
}

export interface IServiceOptions {
  relations?: IRelationOption[];
}
