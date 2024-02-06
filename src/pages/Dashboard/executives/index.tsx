import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { CiSearch } from "react-icons/ci";
import { AiOutlinePlus } from "react-icons/ai";
import Table from "@/components/tables";
import { getDashboardExec } from "@/services/dashboardService";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "@/components/EmptyState";
import useDebounce from "@/hooks/useDebounce";

const Executives: React.FC = () => {
  const navigate = useNavigate();
  const columns = [
    { field: "name", header: "Name" },
    { field: "createdAt", header: "Date Created" },
    { field: "updatedAt", header: "Last Modified" },
    { field: "percentageCompleted", header: "Profile Completed" },
  ];

  const DATASIZE = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [newData, setNewData] = useState([]);
  const [dataCount, setDataCount] = useState(20);

  const { data: DashExecData, isLoading } = useQuery(["dashExec", currentPage, debouncedSearchValue], () =>
    getDashboardExec(currentPage, debouncedSearchValue),
  );
  useEffect(() => {
    console.log(DashExecData?.data?.result);
    setNewData(DashExecData?.data?.result);
    setDataCount(DashExecData?.data?.count);
  }, [DashExecData?.data?.count, DashExecData?.data?.result]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-[700]">Active Executive</p>
        <div className="flex items-center space-x-2">
          <div className="flex bg-grey-100 space-x-2 items-center rounded-md p-2">
            <CiSearch />
            <input
              type="text"
              className="bg-grey-100 active:outline-none text-[12px] focus:outline-none"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div
            className="flex border text-[12px] bg-grey-900 space-x-3 items-center text-white rounded-md p-2 cursor-pointer hover:bg-grey-100 hover:text-grey-900 hover:border-none"
            onClick={() => navigate("/executives/create")}
          >
            <AiOutlinePlus />
            <span>New Executive</span>
          </div>
        </div>
      </div>
      <hr className="border-grey-100 my-5" />
      {newData?.length === 0 ? (
        <EmptyState title="No records yet" />
      ) : (
        <div>
          <Table
            columns={columns}
            rowData={newData}
            name="dashExec"
            loading={isLoading}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            dataCount={dataCount}
            dataSize={DATASIZE}
          />
        </div>
      )}
    </div>
  );
};

export default Executives;
