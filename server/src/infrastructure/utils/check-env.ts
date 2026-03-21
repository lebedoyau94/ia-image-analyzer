function parseNodeVersion(version: string): [number, number, number] {
  const [major = '0', minor = '0', patch = '0'] = version.split('.');
  return [Number(major), Number(minor), Number(patch)];
}

function isNodeVersionAtLeast(current: string, minimum: string): boolean {
  const [cMajor, cMinor, cPatch] = parseNodeVersion(current);
  const [mMajor, mMinor, mPatch] = parseNodeVersion(minimum);

  if (cMajor !== mMajor) {
    return cMajor > mMajor;
  }
  if (cMinor !== mMinor) {
    return cMinor > mMinor;
  }
  return cPatch >= mPatch;
}

export function checkEnv(): void {
  const minimumVersion = '18.0.0';
  const currentVersion = process.versions.node;

  if (!isNodeVersionAtLeast(currentVersion, minimumVersion)) {
    console.error(
      `Runtime validation failed: Node.js ${minimumVersion}+ is required. Detected ${currentVersion}. ` +
        'Please upgrade Node.js to continue.',
    );
    process.exit(1);
  }
}
