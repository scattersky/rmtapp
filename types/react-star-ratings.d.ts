declare module "react-star-ratings" {
  import { FC } from "react";

  export interface StarRatingsProps {
    rating: number;
    changeRating?: (newRating: number, name?: string) => void;

    numberOfStars?: number;
    name?: string;

    starRatedColor?: string;
    starEmptyColor?: string;
    starHoverColor?: string;

    starDimension?: string;
    starSpacing?: string;

    svgIconPath?: string;
    svgIconViewBox?: string;

    isSelectable?: boolean;
    isAggregateRating?: boolean;
  }

  const StarRatings: FC<StarRatingsProps>;

  export default StarRatings;
}