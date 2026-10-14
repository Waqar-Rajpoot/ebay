/** Thrown when eBay answers with a non-success HTTP status. */
export class EbayApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "EbayApiError";
  }
}