/**
 * Error that is thrown on bad request.
 */
class BadRequestException extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

export default BadRequestException;
