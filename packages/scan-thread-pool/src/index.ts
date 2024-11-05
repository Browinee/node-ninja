import { Subject } from "rxjs";
import { ScanService } from "./scan.js";
import getFolderSize from "get-folder-size";

const service = new ScanService();
const stream$ = new Subject<string>();
service.startScan(stream$, "../");
stream$.subscribe(async (value) => {
  console.log("Subscribe get scan result:", value, await getSize(value));
});

async function getSize(path: string) {
  const res = await getFolderSize(path);

  return (res.size / 1024 / 1024).toFixed(2) + "M";
}
