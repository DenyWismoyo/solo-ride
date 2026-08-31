import * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "gmp-place-autocomplete": any;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "gmp-place-autocomplete": any;
    }
  }
}
