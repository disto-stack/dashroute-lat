export class InvalidStateTransitionException extends Error {
  constructor(
    public readonly currentStatus: string,
    public readonly targetStatus: string,
  ) {
    super(`Cannot transition order from state '${currentStatus}' to '${targetStatus}'`);
    this.name = 'InvalidStateTransitionException';
  }
}
