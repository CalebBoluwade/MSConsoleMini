import { Metric } from "@tremor/react";
import React from "react";
import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { useDiskDataQuery } from "@/lib/helpers/api/RemoteService";
import LoadingEventUI from "./LoadingUI";
import { Progress } from "./ui/progress";

const DiskDrive = ({ AgentId }: { AgentId: string | null }) => {
  const {
    data: diskData,
    isLoading: diskDataLoading,
    isError: diskDataError,
    // refetch: refetchDiskData
  } = useDiskDataQuery(
    {
      AgentId,
    },
    {
      // pollingInterval: 5 * 60 * 5000,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: false,
    }
  );

  let content: React.JSX.Element = <>No Data</>;
  console.log(AgentId, diskData, diskDataLoading, diskDataError);

  if (diskDataLoading) {
    content = <LoadingEventUI />;
  }

  if (diskDataError) {
    content = <p>Error loading data</p>;
  }

  if ((diskData ?? []).length) {
    content = (
      <>
        {(diskData ?? []).map((item, index: number) => (
          <div
            className={`m-1 p-2 mb-2 min-h-[90px] rounded border shadow-md`}
            key={index + 1}
          >
            <p className="py-1 font-semibold text-lg">Drive {item.Drive}</p>

            <div className="relative w-full bg-gray-200 h-1.5 mt-1.5 rounded-full gap-y-4">
              <Metric className="absolute top-4">
                {item.FreeSpaceFormatted}
              </Metric>
              <Progress
                value={
                  ((item.DiskSize - item.FreeSpaceUnformatted) /
                    item.DiskSize) *
                  100
                }
                className={`rounded bg-[#4CAF50]`}
                // className={`w-[60%] bg-[#4CAF50] bg-[${
                //   ((item.DiskSize - item.FreeSpaceUnformatted) /
                //     item.DiskSize) *
                //     100 <
                //   70
                //     ? "#4CAF50"
                //     : ((item.DiskSize - item.FreeSpaceUnformatted) /
                //         item.DiskSize) *
                //         100 >
                //         70 &&
                //       ((item.DiskSize - item.FreeSpaceUnformatted) /
                //         item.DiskSize) *
                //         100 <
                //         85
                //     ? "#4CAF50"
                //     : "#4CAF50"
                // }]-500`}
                color="fuchsia"
              />
              <Metric
                color={
                  ((item.DiskSize - item.FreeSpaceUnformatted) /
                    item.DiskSize) *
                    100 <
                  70
                    ? "teal"
                    : ((item.DiskSize - item.FreeSpaceUnformatted) /
                        item.DiskSize) *
                        100 >
                        70 &&
                      ((item.DiskSize - item.FreeSpaceUnformatted) /
                        item.DiskSize) *
                        100 <
                        85
                    ? "amber"
                    : "rose"
                }
                className="absolute right-0 top-4"
              >
                {item.DiskSizeFormatted}
              </Metric>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <Card
      className="relative w-full --lg:w-3/4 min-h-[200px] max-h-[300px] overflow-y-auto"
      //  className="relative min-h-[400px] my-3 leading-6 px-4 py-3"
    >
      <CardHeader>
        <CardTitle className="inline-flex gap-3 items-center p-2">
          <p className="font-semibold">Drives</p>
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 max-md:grid-cols-1">
        {content}
      </CardContent>
    </Card>
  );
};

// export default React.memo(DiskDrive);
export default DiskDrive;
