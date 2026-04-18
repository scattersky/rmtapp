declare module "react-collapse" {
  import { ReactNode } from "react";

  export interface CollapseProps {
    isOpened: boolean;
    children?: ReactNode;
  }

  export const Collapse: React.FC<CollapseProps>;
}