import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'demo-eom',
  outputTargets: [
    {
      type: 'dist',
      copy: [{ src: 'eom.json' }]
    },
    {
      type: 'dist-custom-elements-bundle'
    },
    {
      type: 'www',
      serviceWorker: false
    }
  ]
};
