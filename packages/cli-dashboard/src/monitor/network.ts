import si from "systeminformation"

import { ChartType } from "../types.js"

class NetworkMonitor {
  sparkline: ChartType
  interval: NodeJS.Timeout | null = null
  networkData: number[] = []


  constructor(line: ChartType) {
    this.sparkline = line

  }
  init() {
    this.networkData = Array(60).fill(0)


    si.networkInterfaceDefault(iface => {
      const updater = () => {
        si.networkStats(iface, data => {
          this.updateData(data[0]);
        });
      };

      updater()

      this.interval = setInterval(updater, 1000)
    })


  }
  updateData(data: si.Systeminformation.NetworkStatsData) {
    const rx_sec = Math.max(0, data['rx_sec']);
    this.networkData.shift();
    this.networkData.push(rx_sec);
    const rx_label = `Receiving:      ${formatSize(rx_sec)}\nTotal received: ${formatSize(data['rx_bytes'])}`
    this.sparkline.setData([rx_label], [this.networkData]);
    this.sparkline.screen.render();
  }
}

const formatSize = (bytes: number) => {
  if (bytes == 0) {
    return '0.00 B';
  }

  if (bytes < 1024) {
    return Math.floor(bytes) + ' B'
  }



  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  }

  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';


}
export default NetworkMonitor;
