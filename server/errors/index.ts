/**
 * NexusFlow Custom Error Hierarchy
 * Parameter: Code Quality - Strict, typed domain errors with status codes and metadata
 */

export abstract class NexusFlowError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      errorCode: this.errorCode,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context
    };
  }
}

export class ValidationError extends NexusFlowError {
  readonly statusCode = 400;
  readonly errorCode = 'ERR_VALIDATION_FAILED';
}

export class SecurityViolationError extends NexusFlowError {
  readonly statusCode = 403;
  readonly errorCode = 'ERR_SECURITY_GUARDRAIL_VIOLATION';
}

export class WorkflowExecutionError extends NexusFlowError {
  readonly statusCode = 500;
  readonly errorCode = 'ERR_WORKFLOW_EXECUTION_FAILURE';
}

export class ResourceNotFoundError extends NexusFlowError {
  readonly statusCode = 404;
  readonly errorCode = 'ERR_RESOURCE_NOT_FOUND';
}
