import React from 'react';
import { ThumbsUp, ThumbsDown, Circle } from 'lucide-react';

interface BanStatusProps {
  status: boolean | null;
}

const BanStatus: React.FC<BanStatusProps> = ({ status }) => {
  if (status === true) {
    return <ThumbsDown className="h-5 w-5 text-red-500" />;
  } else if (status === false) {
    return <ThumbsUp className="h-5 w-5 text-green-500" />;
  } else {
    return <Circle className="h-5 w-5 text-orange-500" />;
  }
};

export default BanStatus;