declare module "react-collapse" {
  import { ReactNode } from "react";

  export interface CollapseProps {
    isOpened: boolean;
    theme?: {
      collapse?: string;
      content?: string;
    };
    children?: ReactNode;
  }

  export const Collapse: React.FC<CollapseProps>;
}
