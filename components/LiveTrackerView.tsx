import React, { InputHTMLAttributes } from "react";

import { Tracker } from "@tremor/react";
import { StatusEmoji, TremorColor } from "@/lib/hooks/useStatusHooks";

interface SyntheticMonitorTracker<T>
  extends InputHTMLAttributes<HTMLDivElement> {
  icon?: React.JSX.Element;
  onClick?: () => void;
  data: Array<T>;
}

const LiveTrackerView: React.FC<SyntheticMonitorTracker<BaseMonitor>> = ({
  ...props
}) => {
  const TrackerData = (props.data ? props.data : []).map(
    (item, _) => ({
      key: _.toString(),
      tooltip: `${item.ServiceName} ${item.IPAddress} ${item.CurrentHealthCheck.toUpperCase()} ${StatusEmoji(
        item.CurrentHealthCheck
      )}`,
      color: TremorColor(item.CurrentHealthCheck),
      entity: item.IPAddress,
    })
  );

  console.log(TrackerData)

  return (
    <div className="w-full">
      <Tracker
        data={TrackerData}
        className="mt-2 text-xl font-semibold gap-1 rounded"
        // hoverEffect={true}
      />
    </div>
  );
};

export default LiveTrackerView;
