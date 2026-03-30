type DateLike = Date | null | undefined;

export type RawEntity<TDomainEntity> = {
  [K in keyof TDomainEntity]: TDomainEntity[K] extends DateLike
    ? Exclude<TDomainEntity[K], Date> | string
    : TDomainEntity[K];
};
