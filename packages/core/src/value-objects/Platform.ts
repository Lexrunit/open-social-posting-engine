/**
 * Platform enumeration
 * Represents all supported social media platforms
 */
export enum Platform {
  LINKEDIN = 'linkedin',
  X = 'x',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
}

/**
 * Value object for platform with validation
 */
export class PlatformVO {
  private constructor(public readonly value: Platform) {}

  static create(value: string): PlatformVO {
    const normalized = value.toLowerCase();
    if (!Object.values(Platform).includes(normalized as Platform)) {
      throw new Error(`Invalid platform: ${value}`);
    }
    return new PlatformVO(normalized as Platform);
  }

  equals(other: PlatformVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
