import { isAxiosError } from "axios";
import * as core from "@actions/core";

export function catchAxiosErrorDecorator() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error: any) {
        if (!isAxiosError(error)) {
          throw error;
        }
        core.setFailed(error.response?.data?.error?.message);
      }
    };
    return descriptor;
  };
}
