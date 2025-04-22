export type QueryParams = {
  keyword: string | undefined;
}

export type Product = {
  productTitle?: string;
  rating?: number;
  numberOfReviews?: number;
  productUrlImage?: string;
}