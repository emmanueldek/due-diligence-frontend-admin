import { Wrapper } from "@/components";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import CountCard from "@/components/card/CountCard";
import { CiSearch } from "react-icons/ci";
import { AiOutlinePlus } from "react-icons/ai";
import ExNewProfile from "./exNewProfile";
import ExSuggestions from "./exSuggestions";
import ExAddRecord from "./exAddRecord";
import { useQuery } from "@tanstack/react-query";
import { exeCount } from "@/services/executiveService";

interface IExeCount {
  newProfiles: string;
  addRecords: string;
  suggestions: string;
  pendingNewProfiles: string;
  declinedNewProfiles: string;
  pendingRecords: string;
  declinedRecords: string;
  pendingSuggestions: string;
  declinedSuggestions: string;
}

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);
  const [searchValueRecord, setSearchValueRecord] = useState("");
  const [searchValueProfile, setSearchValueProfile] = useState("");
  const [searchValueSuggest, setSearchValuesuggest] = useState("");
  const [countData, setCountData] = useState<IExeCount>();

  const tabs = [
    { name: "New Profile", value: 0, count: countData?.newProfiles || "" },
    { name: "Add Records", value: 1, count: countData?.addRecords || "" },
    { name: "Suggestions", value: 2, count: countData?.suggestions || "" },
  ];

  const { data } = useQuery(["exeNumCount"], exeCount, {});

  useEffect(() => {
    setCountData(data?.data);
  }, [data?.data]);

  const displaySteps = () => {
    switch (step) {
      case 0:
        return (
          <ExNewProfile
            searchValue={searchValueProfile}
            pending={countData?.pendingNewProfiles}
            declined={countData?.declinedNewProfiles}
          />
        );
      case 1:
        return (
          <ExAddRecord
            searchValue={searchValueRecord}
            pending={countData?.pendingRecords}
            declined={countData?.declinedRecords}
          />
        );
      case 2:
        return (
          <ExSuggestions
            searchValue={searchValueSuggest}
            pending={countData?.pendingSuggestions}
            declined={countData?.declinedSuggestions}
          />
        );
      default:
    }
  };

  const handleClick = (e: number) => {
    setStep(e);
  };
  return (
    <div>
      <Wrapper className="bg-white pb-0">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-[700]">Request</p>
          <div className="flex items-center space-x-2">
            <div className="flex bg-grey-100 space-x-2 items-center rounded-md p-2">
              <CiSearch />
              <input
                type="text"
                className="bg-grey-100 active:outline-none text-[12px] focus:outline-none"
                placeholder="Search"
                value={step === 0 ? searchValueProfile : step === 1 ? searchValueRecord : searchValueSuggest}
                onChange={(e) =>
                  step === 0
                    ? setSearchValueProfile(e.target.value)
                    : step === 1
                    ? setSearchValueRecord(e.target.value)
                    : setSearchValuesuggest(e.target.value)
                }
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
        <div className="space-x-10 flex  border-grey-100">
          {tabs.map((item) => (
            <div
              key={item.value}
              className={`cursor-pointer ${
                step === item.value ? "border-b-[2px] text-[#0F172A] text-lg pb-2 font-semibold" : "text-grey-300 pb-2"
              }`}
              onClick={() => handleClick(item.value)}
            >
              <div className="flex space-x-1 items-center">
                <p>{item.name}</p>
                {/* {item.name === "Drafts" ? ( */}
                <div>
                  <CountCard count={item.count} active={step === item.value ? true : false} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Wrapper>
      <Wrapper className="mt-16 bg-white">{displaySteps()}</Wrapper>
    </div>
  );
};

export default Requests;
