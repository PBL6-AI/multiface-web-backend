export abstract class BaseMapper<TDomainEntity, TRawEntity> {
  abstract toDomain(rawEntity: TRawEntity): TDomainEntity;

  abstract toRaw(domainEntity: TDomainEntity): TRawEntity;

  toDomainMany(rawEntities: TRawEntity[]): TDomainEntity[] {
    return rawEntities.map((rawEntity) => this.toDomain(rawEntity));
  }

  toRawMany(domainEntities: TDomainEntity[]): TRawEntity[] {
    return domainEntities.map((domainEntity) => this.toRaw(domainEntity));
  }
}
