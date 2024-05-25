/** Unstable basic validators */
const is = {
  /**
   * `ValidatorOf<function>` which can only check expected argument length.
   */
  function:
    <T extends unknown[], N extends T["length"], R>(
      arglen: N
    ): ((arg: unknown) => arg is (...args: T) => R) =>
    (arg: unknown): arg is (...args: T) => R =>
      typeof arg === "function" && arg.length === arglen,
};

export { is };
