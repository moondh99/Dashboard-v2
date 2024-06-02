import { useEffect, useState } from "react";
import axios from "axios";
import DropDownSelect from "../components/DropDownSelect";
import formatData from "../components/utils/formatData";
import BottomComponent from "../components/monthly/BottomComponent";
import TopComponent from "../components/monthly/TopComponent";

const keyConfig = {
  API_KEY: import.meta.env.VITE_API_KEY,
};

const MonthlyReport = () => {
  const [month, setMonth] = useState<number>(202312);
  const [totalRentCnt, setTotalRentCnt] = useState<number>(0); // 한달간 총 대여 수
  const [totalMoveTime, setTotalMoveTime] = useState<number>(0); // 이용 시간 총합 (평균 이용 시간 구할 때 사용)
  const [totalMoveDist, setTotalMoveDist] = useState<number>(0); // 이동거리 총합 (평균 이동 시간 구할 때 사용)
  const [totalSavedCarb, setTotalSavedCarb] = useState<number>(0); // 총 절약 탄소량
  const [topFiveStation, setTopFiveStation] = useState<any>([]);

  const [responseArr, setResponseArr] = useState<any>();

  const url = `/api/${keyConfig.API_KEY}/json/tbCycleRentUseMonthInfo/1/1000/${month}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(url);
        const response = data.cycleRentUseMonthInfo;
        
        setResponseArr(data.cycleRentUseMonthInfo.row);
        
        let totalMoveTimeSum = 0;
        let totalMoveDistSum = 0;
        let totalSavedCarbSum = 0;
        let findTopStations: any = [];


        response.row.map((info: any) => {

          // 이용시간 전체 평균
          // MOVE_TIME의 총합 / 총 대여수
          // 단위는 분(min)
          totalMoveTimeSum += info.MOVE_TIME ? parseInt(info.MOVE_TIME) : 0;
          setTotalMoveTime(totalMoveTimeSum);

          // 이동거리 전체 평균
          // MOVE_METER / 총 대여수
          // 단위는 미터(m) - Math.floor로 내림하기
          totalMoveDistSum += info.MOVE_METER
            ? Math.floor(parseInt(info.MOVE_METER))
            : 0;
          setTotalMoveDist(totalMoveDistSum);

          // 총 탄소 절감량
          // CARBON_AMT 의 total
          // 단위는 킬로그램(kg)
          totalSavedCarbSum += info.CARBON_AMT ? parseInt(info.CARBON_AMT) : 0;
          setTotalSavedCarb(totalSavedCarbSum);

          // top 5 대여소 안에 드는지 확인
          if (
            findTopStations.length < 5 ||
            info.USE_CNT >
              parseInt(findTopStations[findTopStations.length - 1].USE_CNT)
          ) {
            findTopStations.push(info);
            findTopStations.sort(
              (a: any, b: any) => parseInt(b.USE_CNT) - parseInt(a.USE_CNT)
            );

            if (findTopStations.length > 5) findTopStations.pop();
          }
        });

        setTopFiveStation(findTopStations);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [month]);


  return (
    <div className="my-12 relative">
      {/* select box & text */}
      <div className="flex items-center w-full justify-center">
        <DropDownSelect
          options={[202312, 202311, 202310, 202309, 202308]}
          month={month}
          setMonth={setMonth}
        />
        <p className="relative px-4 text-center text-slate-500">
          해당 통계는 {formatData(month)}, 서울의 1000개의 따릉이 대여소를
          기반으로 분석한 자료입니다.
        </p>
      </div>

      {/* 상단 : 총 대여 건수 / 박스 4개 */}
      <TopComponent month={month} />

      {/* 하단의 컴포넌트 : 탑 5대여소 비교 분석 차트 2개 & 통계 요약 */}
      <BottomComponent topFiveStation={topFiveStation} month={month} totalRentCnt={totalRentCnt} />
    </div>
  );
};

export default MonthlyReport;
