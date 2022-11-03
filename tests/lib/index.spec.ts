import { describe, expect, test } from '@jest/globals';
import bundle from '../../src';
import fs from 'fs';
import path from 'path';

import type { ReferenceObject } from '../../src/spec-types';

describe('bundler should ', () => {
  test('should return bundled doc', async () => {
    const files = ['./tests/camera.yml', './tests/audio.yml'];
    const response = await bundle(
      files.map(file =>
        fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8')
      ),
      {
        base: fs.readFileSync(
          path.resolve(process.cwd(), './tests/base.yml'),
          'utf-8'
        ),
        validate: false,
      }
    );
    
    expect(response).toBeDefined();
  });

  test('should bundle references into components', async () => {
    const files = ['./tests/asyncapi.yaml'];
    const doc = await bundle(
      files.map(file =>
        fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8')
      ),
      {
        referenceIntoComponents: true,
      }
    );

    const asyncapiObject = doc.json();
    const message = asyncapiObject.channels?.['user/signedup']?.subscribe?.message as ReferenceObject;

    expect(message.$ref).toMatch('#/components/messages/UserSignedUp');
  });

  test('should not throw if value of `$ref` is not a string', async () => {
    const files = ['./tests/wrong-ref-not-string.yaml'];

    // If async function `bundle()` resolved Promise successfully, that means it
    // did not throw exception during process of execution, which is the
    // objective of testing.
    expect(
      await bundle(
        files.map(file =>
          fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8')
        ),
        {
          referenceIntoComponents: true,
        }
      )
    ).resolves;
  });

  test('should not throw if value of `$ref` is absent', async () => {
    const files = ['./tests/wrong-ref-absent.yaml'];

    // If async function `bundle()` resolved Promise successfully, that means it
    // did not throw exception during process of execution, which is the
    // objective of testing.
    expect(
      await bundle(
        files.map(file =>
          fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8')
        ),
        {
          referenceIntoComponents: true,
        }
      )
    ).resolves;
  });
});
