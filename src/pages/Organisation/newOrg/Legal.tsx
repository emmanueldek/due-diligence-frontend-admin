import React, { useState, useEffect } from "react";
import { InputFile, InputText } from "@/components";
import { IoChevronBack, IoChevronForward, IoDocumentAttach } from "react-icons/io5";
import { useFormik } from "formik";
import * as Yup from "yup";
import SaveDraftModal from "./SaveDraftModal";
import SavePublish from "./savePublish";
import { IDataProps, ILegalProps } from "@/interface/userCreation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { acceptRecOrg, acceptSugOrg, getOrgData, updateOrg, useUploadPdf } from "@/services/organisationService";
import { Toast } from "@/config/toast";
import { useParams } from "react-router-dom";
import { Circles, ProgressBar } from "react-loader-spinner";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";

interface IOrganisationProps {
  year?: string;
  fillingStatus?: string;
  totalTaxLiability?: string;
  lgrDocuments: string[];
}

interface IactionProps {
  next: () => void;
  prev: () => void;
  data: IDataProps;
  setData: (data: IDataProps | ((prevData: IDataProps) => IDataProps)) => void;
  execDocID: string;
  sugDocId: string;
  recDocId: string;
}

const validationSchema = Yup.object({
  year: Yup.string().required("Please fill in this field"),
  fillingStatus: Yup.string().required("Please fill in this field"),
  totalTaxLiability: Yup.string().required("Please fill in this field"),
});

const Legal: React.FC<IactionProps> = ({ next, prev, data, setData, execDocID, sugDocId, recDocId }) => {
  const { id } = useParams();
  const requestId = id || "";
  const [newNext, setNext] = useState(false);
  const [dataTab, setDataTab] = useState<number | null>(null);
  const [dataList, setDataList] = useState<IOrganisationProps[]>(data.legal || []);
  const [open, setOpen] = useState<number | null>(null);
  const legalData = { legal: dataList };
  const [checkAdd, setCheckAdd] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);

  const columns: any = [
    { field: "year", header: "Year" },
    { field: "fillingStatus", header: "Filing Status" },
    { field: "totalTaxLiability", header: "Litigation Description" },
    { field: "lgrDocuments", header: "Attachments" },
  ];

  const { data: legalRegulatoryData, isLoading: incomingData } = useQuery(
    ["orgLegal", "legalRegulatory", requestId],
    () => getOrgData("legalRegulatory", requestId),
  );

  useEffect(() => {
    if (
      legalRegulatoryData?.data?.legalRegulatory &&
      Object.keys(legalRegulatoryData?.data?.legalRegulatory).length > 0
    ) {
      setDataList(legalRegulatoryData?.data?.legalRegulatory);
    }
  }, [legalRegulatoryData?.data]);

  const { mutate: postImage, isLoading: progressLoading } = useMutation(useUploadPdf, {
    onSuccess: ({ data: uploadRes }) => {
      Toast.success("File uploaded successfully");
      setAvailableFiles((prev: any) => [...prev, uploadRes?.name]);
    },

    onError: (error) => {
      Toast.error("something went wrong");
      console.log(error);
    },
  });

  const { mutate: postLegal } = useMutation(updateOrg, {
    onError: (error) => {
      console.log(error);
      Toast.error("Legal/Regulatory not saved");
    },
    onSuccess: () => {
      Toast.success("Saved legal/regulatory successfully");
      if (newNext) {
        next();
      }
    },
  });

  const { mutate: acceptSuggest, isLoading: acceptLoading } = useMutation(acceptSugOrg, {
    onError: (error) => {
      console.log(error);
      Toast.error("Request failed to deliver");
    },
    onSuccess: (data) => {
      console.log(data);
      Toast.success(" Request accepted");
    },
  });

  const { mutate: acceptRecord, isLoading: recordLoading } = useMutation(acceptRecOrg, {
    onError: (error) => {
      console.log(error);
      Toast.error("Request failed to deliver");
    },
    onSuccess: () => {
      Toast.success("Record accepted");
    },
  });

  const handleUploads = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      let documentArray = Array.from(e.target.files);
      documentArray.forEach((doc) => {
        const imageFile = new FormData();
        imageFile.append("file", doc);
        postImage({ imageFile, flags: "organizationDocuments" });
      });
    }
  };
  const initialValues: ILegalProps = {
    year: "",
    filingStatus: "",
    totalTaxLiability: "",
    lgrDocuments: [],
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleModal = (id: number) => {
    setOpen(JSON.stringify(errors).length !== 2 ? null : id);
  };

  // const onSubmit = async (data: IOrganisationProps) => {
  //   const newData = {
  //     ...data,
  //     lgrDocuments: file,
  //   };
  //   if (dataTab !== null) {
  //     // Update existing entry in the dataList
  //     const updatedDataList = [...dataList];
  //     updatedDataList[dataTab] = newData;
  //     setDataList(updatedDataList);
  //     setDataTab(null); // Clear the selected index
  //   } else {
  //   }
  // };

  const onSubmit = async (data: IOrganisationProps) => {
    let isDataExist: boolean;

    const checkIfDataExist: () => boolean = () => {
      let res = false;
      // dataList.forEach((item) => {
      //   let currItem = item
      //   if (item.year != data.year) {
      //     res = false;
      //   } else {
      //     res = true;
      //   }
      // });
      for (let i = 0; i <= dataList.length; i++) {
        if (dataList[i]?.year === data?.year) {
          res = true;
          break;
        }
        res = false;
      }
      return res;
    };

    isDataExist = checkIfDataExist();
    console.log(checkIfDataExist());

    const newData = {
      ...data,
      lgrDocuments: availableFiles,
    };
    console.log(newData);
    if (dataTab !== null && isDataExist) {
      // Update existing entry in the dataList
      const updatedDataList = [...dataList];
      updatedDataList[dataTab] = newData;
      setDataList(updatedDataList);
      setDataTab(null); // Clear the selected index
      resetForm();
      setAvailableFiles([]);
    } else if (dataTab === null && !isDataExist) {
      setDataList([...dataList, newData]);
      if (checkAdd) {
        setCheckAdd(false);
        resetForm();
        setAvailableFiles([]);
      }
    } else if (dataTab === null && isDataExist) {
      toast.error("Data already exist");
    } else if (dataTab !== null && !isDataExist) {
      toast.error("Da");
    }
  };

  const handleQuerySubmit = () => {
    const data = { legalRegulatory: dataList };
    if (dataList.length !== 0) {
      if (sugDocId) {
        const payLoad = { flag: "legalRegulatory", data: data, orgId: sugDocId };
        acceptSuggest(payLoad);
      } else if (recDocId) {
        const payLoad = { flag: "legalRegulatory", data: data, orgId: recDocId };
        acceptRecord(payLoad);
      } else {
        const payload = {
          data: data,
          flag: "legalRegulatory",
          orgId: requestId,
          execOrgDocId: execDocID,
        };
        postLegal(payload);
      }
    } else Toast.error("Please add a record");
  };

  const { handleChange, setValues, values, handleSubmit, errors, touched, resetForm } = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    validateOnBlur: true,
    enableReinitialize: true,
  });

  const handleEdit = (index: number) => {
    let selectedData = dataList[index];
    // Set the form fields with data from the selected index
    setValues(selectedData);
    setDataTab(index); // Set the selected index
    console.log(selectedData);
    setAvailableFiles((prev: string[]) => [...prev, ...selectedData.lgrDocuments]);
  };

  // const handleDelete = (index: number) => {
  //   // Remove the data entry from the dataList
  //   const updatedDataList = [...dataList];
  //   updatedDataList.splice(index, 1);
  //   setDataList(updatedDataList);
  //   setDataTab(null); // Clear the selected index
  // };

  const getError = (key: keyof IOrganisationProps) => {
    return touched[key] && errors[key];
  };

  if (incomingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Circles color="#00000" width={40} />
      </div>
    );
  }

  return (
    <div>
      <p className="font-[700] text-2xl">Legal</p>

      <div className="space-y-2">
        <table className="w-full">
          <thead>
            <tr className="h-[50px] px-8 rounded overflow-hidden bg-grey-50 w-full">
              {columns &&
                columns.map((head: any, k: number) => (
                  <th key={k} className="px-2 text-left text-sm text-[#353740]">
                    {head.header}{" "}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {dataList?.map((data: any, i) => (
              // <div
              //   className="rounded-md bg-grey-100 p-3 flex items-center justify-between"
              //   key={i}
              //   onClick={() => handleEdit(i)} // Allow editing when a row is clicked
              // >
              //   <p>{data.year}</p>
              //   <div className="flex space-x-1">
              //     {check === i ? <IoChevronDown /> : <IoChevronUp />}
              //     <IoRemoveOutline onClick={() => handleDelete(i)} />
              //   </div>
              // </div>
              <tr key={i} className="hover:bg-[#fbfbfb] transition-all cursor-pointer" onClick={() => handleEdit(i)}>
                {columns.map((col: any, j: number) => {
                  return (
                    <>
                      <td
                        key={j}
                        className={`px-2 text-grey-500 py-2 ${col.field === "audFinancials" ? "text-[#144D98]" : ""}`}
                      >
                        {col.field === "lgrDocuments" ? (
                          <>
                            {data.lgrDocuments.map((doc: string, k: number) => (
                              <div className="flex space-x-1" key={k}>
                                <p className="text-xs text-[#0029FD]">{doc}</p>
                              </div>
                            ))}
                          </>
                        ) : (
                          <>{data[col.field as keyof ILegalProps]}</>
                        )}
                      </td>
                    </>
                  );
                })}
                <hr />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action="" onSubmit={handleSubmit} className="my-5 space-y-5">
        <div>
          <InputText
            id="year"
            isRequired={true}
            label="Year"
            placeholder="Enter the year"
            value={values.year}
            error={getError("year")}
            type="text"
            onChange={handleChange}
            name="year"
          />
        </div>
        <div>
          <InputText
            id="fillingStatus"
            isRequired={true}
            label="Filling Status"
            placeholder="Status"
            value={values.fillingStatus}
            error={getError("fillingStatus")}
            type="text"
            onChange={handleChange}
            name="fillingStatus"
          />
        </div>
        <div>
          <InputText
            id="totalTaxLiability"
            isRequired={true}
            label="Litigation Description"
            placeholder="Enter Litigation description"
            value={values.totalTaxLiability}
            error={getError("totalTaxLiability")}
            type="text"
            onChange={handleChange}
            name="totalTaxLiability"
          />
        </div>
        <div>
          <p className="text-sm mb-2 font-medium">Upload supporting document</p>
          <div>
            <InputFile onChange={(e) => handleUploads(e)} fileType=".pdf" />
            {progressLoading && (
              <div>
                <ProgressBar height={30} width={""} borderColor="#000000" barColor="#008000" />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3 mt-3">
            {availableFiles &&
              availableFiles.map((f: any, i: number) => {
                return (
                  <div key={i}>
                    <div className="flex items-center space-x-3">
                      <div className="bg-grey-100 rounded w-[90px] h-[108px] flex items-center justify-center">
                        <IoDocumentAttach size={30} color="#808080" />
                      </div>
                      <div
                        className="rounded-full flex items-center justify-center bg-red-500 w-[20px] h-[20px] active:bg-red-800 cursor-pointer"
                        onClick={() => setAvailableFiles((prev) => prev.filter((_: any, index: number) => index !== i))}
                      >
                        <RiDeleteBin5Fill size={10} color="#ffffff" />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 my-2">{f.substring(0, 6) + ".pdf"}</p>
                  </div>
                );
              })}
          </div>
        </div>

        <button
          type="submit"
          className="border-dotted w-full border-2 border-grey-900 rounded-md p-3 my-3 flex items-center justify-center active:bg-grey-400"
          onClick={() => setCheckAdd(true)}
        >
          <p>Add record</p>
        </button>
        <div className="flex justify-center my-7">
          <div className="flex items-center w-[60%] justify-between">
            <div
              className="flex space-x-1 items-center rounded-md border border-grey-100 p-1 px-2"
              onClick={() => prev()}
            >
              <div className="bg-grey-100 p-1 rounded">
                <IoChevronBack size={10} />
              </div>
              <p>Previous</p>
            </div>
            <button
              type="button"
              className="flex space-x-1 items-center rounded-md border border-grey-100 p-1"
              onClick={() => {
                handleQuerySubmit();
                setNext(true);
              }}
            >
              <p className="pl-2">Save and continue</p>
              <div className="bg-grey-100 p-1 rounded">
                <IoChevronForward size={10} />
              </div>
            </button>
          </div>
        </div>
        <hr className="border-grey-100 mb-7" />
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="bg-grey-100 rounded-md px-3 py-2 flex items-center justify-center active:bg-grey-900 active:text-white cursor-pointer"
            onClick={handleQuerySubmit}
          >
            {acceptLoading ? (
              <ClipLoader size={10} />
            ) : recordLoading ? (
              <ClipLoader size={10} />
            ) : (
              <p>{sugDocId ? "Accept Request" : recDocId ? "Accept Record" : "Save"}</p>
            )}
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleModal(2)}
              className="bg-grey-900 text-white rounded-md px-3 py-2 flex active:bg-grey-200 items-center justify-center"
            >
              <p>Publish Organization</p>
            </button>
          </div>
        </div>
        {open === 1 && <SaveDraftModal data={legalData} onClose={handleClose} next={next} setData={setData} />}
        {open === 2 && (
          <SavePublish data={legalData} onClose={handleClose} next={next} setData={setData} execDocID={execDocID} />
        )}
      </form>
    </div>
  );
};

export default Legal;
