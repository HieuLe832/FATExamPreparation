import HexDump from "../components/HexDump.jsx";
import { Ask, Calc, DiskStrip, Final, Layout, Must, PageHead, Recipe, Result, Step, Steps, Table, Traps } from "../components/Study.jsx";
import { RealBoot } from "./RealExercise.jsx";

const n = (label) => ({ label, cls: "n" });
const SB = <>S<sub>B</sub></>, SC = <>S<sub>C</sub></>, NF = <>N<sub>F</sub></>, SF = <>S<sub>F</sub></>, SV = <>S<sub>V</sub></>;
const FIELDS = [[0x0b, 2], [0x0d, 1], [0x0e, 2], [0x10, 1], [0x20, 4], [0x24, 4], [0x2c, 4], [0x52, 8]];

export default function Boot() {
  return (
    <section>
      <PageHead tag="Câu 2a" title="Boot sector: 10 thông số của volume" />
      <Ask given="Phần đầu sector 0 của volume (boot sector)." asks="a) Xác định thông tin Volume: bảng 10 dòng, từ loại FAT đến số sector cho 1 cluster." />
      <DiskStrip on={["boot"]} />

      <h2>Hiểu nhanh</h2>
      <p><b>Boot sector</b> là sector 0 của volume. Nó ghi mỗi vùng dài bao nhiêu sector; cộng dồn lại thì ra mỗi vùng bắt đầu ở đâu.</p>
      <Layout label="Volume: Boot dài SB sector, FAT1 và FAT2 mỗi bảng SF sector, sau đó là Data" parts={[
        { label: <>Boot · {SB} sector</>, sub: "bắt đầu ở 0", cls: "l-boot" },
        { label: <>FAT1 · {SF} sector</>, sub: <>bắt đầu ở {SB}</>, cls: "l-fat" },
        { label: <>FAT2 · {SF} sector</>, sub: <>{SB} + {SF}</>, cls: "l-fat" },
        { label: "Data", sub: <>{SB} + {NF} × {SF}</>, cls: "l-data", flex: 2 },
      ]} />

      <h2>Cách giải</h2>
      <Recipe skip={<>Mọi byte khác của boot sector: lệnh nhảy <code>EB 58 90</code>, chữ MSDOS5.0, tên volume, các byte 11–1F, 28–2B, 30–51.</>}>
        <li>
          Đọc 8 ô (số nhiều byte thì đọc ngược):
          <Table head={["Byte", "Dài", "Ký hiệu", "Nghĩa"]} className="must-table" rows={[
            [<Must>0B</Must>, "2", "", "Số byte / sector"],
            [<Must>0D</Must>, "1", SC, "Số sector / cluster"],
            [<Must>0E</Must>, "2", SB, "Số sector vùng boot"],
            [<Must>10</Must>, "1", NF, "Số bảng FAT"],
            [<Must>20</Must>, "4", SV, "Tổng số sector của volume"],
            [<Must>24</Must>, "4", SF, "Số sector / bảng FAT"],
            [<Must>2C</Must>, "4", "", "Cluster đầu của RDET (thường là 2)"],
            [<Must>52</Must>, "8", "", "Loại FAT, viết bằng chữ"],
          ]} />
        </li>
        <li>
          Tính:
          <div className="formulas">
            <Must>FAT1 = {SB}</Must>
            <Must>FAT2 = {SB} + {SF}</Must>
            <Must>Data = {SB} + {NF} × {SF}</Must>
            <Must>RDET = Data + (cluster RDET − 2) × {SC}</Must>
            <Must>Dung lượng = {SV} × 512</Must>
          </div>
        </li>
      </Recipe>

      <h2>Làm mẫu trên đề mini</h2>
      <Steps>
        <Step title="Đọc 8 ô">
          <HexDump id="boot" focus={FIELDS} />
        </Step>
        <Step title="Tính vị trí các vùng">
          <Calc>FAT1 = {SB} = 6</Calc>
          <Calc>FAT2 = {SB} + {SF} = 6 + 2 = 8</Calc>
          <Calc>Data = {SB} + {NF} × {SF} = 6 + 2 × 2 = 10</Calc>
          <Calc>RDET = 10 + (2 − 2) × 2 = 10</Calc>
          <Calc>Dung lượng = 64 × 512 = 32 768 byte = 32 KB</Calc>
          <Layout label="Đề mini: Boot 0–5, FAT1 6–7, FAT2 8–9, Data 10–63" parts={[
            { label: "Boot", sub: "0 – 5", cls: "l-boot" },
            { label: "FAT1", sub: "6 – 7", cls: "l-fat" },
            { label: "FAT2", sub: "8 – 9", cls: "l-fat" },
            { label: "Data (RDET ở đầu)", sub: "10 – 63", cls: "l-data", flex: 3 },
          ]} />
        </Step>
      </Steps>
      <Final title="Đáp án đề mini">
        <Table
          head={["STT", "Nội dung", n("Giá trị")]}
          rows={[
            ["1", "Loại FAT", "FAT32"],
            ["2", "Số byte / sector", "512"],
            ["3", <>Số sector vùng boot ({SB})</>, "6"],
            ["4", <>Số bảng FAT ({NF})</>, "2"],
            ["5", <>Số sector / bảng FAT ({SF})</>, "2"],
            ["6", "Dung lượng", "64 × 512 = 32 KB"],
            ["7", "Sector đầu FAT1", "6"],
            ["8", "Sector đầu RDET", "10"],
            ["9", "Sector đầu Data", "10"],
            ["10", <>Số sector / cluster ({SC})</>, "2"],
          ]}
        />
        <Result>Các câu sau dùng tiếp: {SC} = 2, FAT1 = 6, FAT2 = 8, Data = 10.</Result>
      </Final>

      <h2>Làm trên đề thật</h2>
      <RealBoot />

      <h2>Dễ sai</h2>
      <Traps items={[
        "Cộng thêm một vùng RDET riêng sau FAT2. FAT32 không có vùng đó: RDET nằm trong Data, ở cluster 2, nên sector đầu RDET = sector đầu Data.",
        <>Đọc xuôi <code>26 00</code> thành 9 728. Đúng là đảo lại: <code>0026</code> = 38.</>,
        <>Lấy dung lượng từ {SF}. Dung lượng dùng {SV} (byte 20).</>,
      ]} />
    </section>
  );
}
