type Pretify<T> = {
  [K in keyof T]: T[K] extends object ? Pretify<T[K]> : T[K];
};
