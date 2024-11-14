import si from 'systeminformation';
import contrib from 'blessed-contrib';

const colors = ['magenta', 'cyan', 'blue', 'yellow', 'green', 'red'];

type CpuData = {
  title: string;
  style: {
    line: string;
  }
  x: number[];
  y: number[];
}

class CpuMonitor {

  lineChart: contrib.Widgets.PictureElement;
  cpuData: CpuData[] = [];
  interval: NodeJS.Timeout | null = null;

  constructor(line: contrib.Widgets.PictureElement) {
    this.lineChart = line;
  }

  init() {
    si.currentLoad(data => {

      this.cpuData = data.cpus.map((cpu, i) => {
        console.log("cpu", cpu);

        return {
          title: 'CPU' + (i + 1),
          style: {
            line: colors[i % colors.length],
          },
          x: Array(60).fill(0).map((_, i) => 60 - i),
          y: Array(60).fill(0)
        };
      });

      this.updateData(data);

      this.interval = setInterval(() => {
        si.currentLoad(data => {
          this.updateData(data);
        });
      }, 1000);
    });
  }

  updateData(data: si.Systeminformation.CurrentLoadData) {
    data.cpus.forEach((cpu, i) => {
      let loadString = cpu.load.toFixed(1).toString();

      while (loadString.length < 6) {
        loadString = ' ' + loadString;
      }

      loadString = loadString + '%';

      this.cpuData[i].title = 'CPU' + (i + 1) + loadString;
      this.cpuData[i].y.shift();
      this.cpuData[i].y.push(cpu.load);
    });

    this.lineChart.setData(this.cpuData);
    this.lineChart.screen.render();
  }
}

export default CpuMonitor;
