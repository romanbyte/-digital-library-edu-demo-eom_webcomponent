import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'demo-eom',
  globalStyle: 'src/global/global.css',
  outputTargets: [
    {
      type: 'dist',
      copy: [{ src: 'eom.json' }],
    },
    {
      type: 'dist-custom-elements-bundle'
    },
    {
      type: 'www',
      serviceWorker: false,

    }
  ]
};
