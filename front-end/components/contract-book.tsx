import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import HTMLFlipBook from "react-pageflip";
import VNnum2words from "vn-num2words";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomAlertDialog } from "./alert-dialog";

// Cover page component
const PageCover = React.forwardRef<HTMLDivElement, React.PropsWithChildren<{}>>(
  (props, ref) => (
    <div
      className="page page-cover bg-muted-foreground flex items-center justify-center"
      ref={ref}
      data-density="hard"
      style={{ height: "100%" }}
    >
      <div className="page-content h-full flex items-center justify-center">
        <h2 className="text-2xl font-bold">{props.children}</h2>
      </div>
    </div>
  )
);

// Normal page component
interface PageProps extends React.PropsWithChildren<{}> {
  number: number;
}
const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => (
  <div className="page bg-background" ref={ref}>
    <div className="page-content p-8 text-[15.5px] leading-relaxed relative">
      {props.children}
      <div className="page-footer absolute top-3 right-8 text-xs text-gray-400">
        Page {props.number}
      </div>
    </div>
  </div>
));

interface ContractBookProps {
  contractRef?: React.Ref<HTMLDivElement>;
  rentalFrom: Date;
  rentalYears?: string;
  tenantChecked?: boolean;
  landlordChecked?: boolean;
  setTenantChecked?: (checked: boolean) => void;
  landlordInfo: any;
  landlordDetail: any;
  tenantInfo: any;
  tenantDetail: any;
  roomDetail: any;
  isLandlord?: boolean;
  handleLandlordSign?: () => void;
}

const ContractBook: React.FC<ContractBookProps> = ({
  contractRef,
  rentalFrom,
  rentalYears,
  tenantChecked = false,
  landlordChecked = false,
  setTenantChecked,
  landlordInfo,
  landlordDetail,
  tenantInfo,
  tenantDetail,
  roomDetail,
  isLandlord,
  handleLandlordSign,
}) => {
  const flipBookRef = useRef<any>(null);
  console.log("lanlordChecked", landlordChecked);

  return (
    <div className="w-full">
      <div className="flex justify-center items-center w-full h-full">
        {/* @ts-ignore */}
        <HTMLFlipBook
          width={350}
          height={500}
          size="stretch"
          minWidth={200}
          maxWidth={600}
          minHeight={300}
          maxHeight={800}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          className="demo-book shadow-lg w-full max-w-[370px] sm:max-w-[420px] md:max-w-[500px]"
          ref={flipBookRef}
        >
          {/* Cover */}
          <PageCover>
            <div className="font-bold text-2xl sm:text-3xl text-center">
              HỢP ĐỒNG THUÊ NHÀ
            </div>
          </PageCover>

          {/* Page 1 */}
          <Page number={1}>
            <div className="text-center font-bold text-[8px] lg:text-base mb-2">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-center mb-2 text-[8px] lg:text-base">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="text-right mb-4 text-[8px] lg:text-base">
              Hà Nội, ngày ..
              <span className="text-blue-600">{rentalFrom.getDate()}</span>..
              tháng ..
              <span className="text-blue-600">{rentalFrom.getMonth() + 1}</span>
              .. năm ..
              <span className="text-blue-600">{rentalFrom.getFullYear()}</span>
              ..
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              - Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              - Căn cứ vào Luật Thương mại số 36/2005/QH11 ngày 14 tháng 06 năm
              2005;
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              - Căn cứ vào nhu cầu và sự thỏa thuận của các bên tham gia Hợp
              đồng;
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              Hôm nay, ngày ..
              <span className="text-blue-600">{rentalFrom.getDate()}</span>..
              tháng ..
              <span className="text-blue-600">{rentalFrom.getMonth() + 1}</span>
              .. năm ..
              <span className="text-blue-600">{rentalFrom.getFullYear()}</span>
              ..
            </div>
            <div className="font-semibold mt-4 text-[8px] lg:text-base">
              BÊN CHO THUÊ (Bên A):
            </div>
            <div className="text-[8px] lg:text-base">
              Ông: …………
              <span className="text-blue-500">{landlordInfo?.name}</span>
              …………..
            </div>
            <div className="text-[8px] lg:text-base">
              CMND số:......
              <span className="text-blue-600">
                {landlordDetail?.identity_card?.id_number}
              </span>
              .......... Cơ quan cấp………….
              <span className="text-blue-600">
                {landlordDetail?.identity_card?.issued_by}
              </span>
              ..……….. Ngày cấp:......
              <span className="text-blue-600">
                {landlordDetail?.identity_card?.issue_date
                  ? format(
                      landlordDetail.identity_card.issue_date,
                      "dd/MM/yyyy"
                    )
                  : ""}
              </span>
              ........
            </div>
            <div className="text-[8px] lg:text-base">
              Nơi ĐKTT:........{" "}
              <span className="text-blue-600">
                {landlordDetail?.identity_card?.place_of_residence}
              </span>
              ........
            </div>
            <div className="font-semibold mt-4 text-[8px] lg:text-base">
              BÊN THUÊ (Bên B):
            </div>
            <div className="text-[8px] lg:text-base">
              Ông: …………<span className="text-blue-500">{tenantInfo?.name}</span>
              …………..
            </div>
            <div className="text-[8px] lg:text-base">
              CMND số:......
              <span className="text-blue-600">
                {tenantDetail?.identity_card?.id_number}
              </span>
              .......... Cơ quan cấp………….
              <span className="text-blue-600">
                {tenantDetail?.identity_card?.issued_by}
              </span>
              ..……….. Ngày cấp:......
              <span className="text-blue-600">
                {tenantDetail?.identity_card?.issue_date
                  ? format(tenantDetail.identity_card.issue_date, "dd/MM/yyyy")
                  : ""}
              </span>
              ........
            </div>
            <div className="text-[8px] lg:text-base">
              Nơi ĐKTT:........{" "}
              <span className="text-blue-600">
                {tenantDetail?.identity_card?.place_of_residence}
              </span>
              ........
            </div>
            <div className="mt-4 text-[8px] lg:text-base">
              Bên A và Bên B sau đây gọi chung là “Hai Bên” hoặc “Các Bên”.
              <br />
              Sau khi thảo luận, Hai Bên thống nhất đi đến ký kết Hợp đồng thuê
              nhà (“Hợp Đồng”) với các điều khoản và điều kiện dưới đây:
            </div>
            <div className="font-bold my-2 text-[8px] lg:text-base">
              Điều 1. Nhà ở và các tài sản cho thuê kèm theo nhà ở:
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              1.1. Bên A đồng ý cho Bên B thuê và Bên B cũng đồng ý thuê quyền
              sử dụng đất và một căn nhà ......... tầng gắn liền với quyền sử
              dụng đất tại địa chỉ ... để sử dụng làm nơi để ở.
              <br />
            </div>
          </Page>

          {/* Page 2 */}
          <Page number={2}>
            <div className="mb-2 text-[8px] lg:text-base">
              Diện tích quyền sử dụng đất:...
              <span className="text-blue-600">{roomDetail?.area}</span>
              ...m2;
              <br />
              Diện tích căn nhà :...
              <span className="text-blue-600">{roomDetail?.area}</span>
              ...m2;
              <br />
              1.2. Bên A cam kết quyền sử sụng đất và căn nhà gắn liền trên đất
              trên là tài sản sở hữu hợp pháp của Bên A. Mọi tranh chấp phát
              sinh từ tài sản cho thuê trên Bên A hoàn toàn chịu trách nhiệm
              trước pháp luật.
            </div>
            <div className="font-bold mb-2 text-[8px] lg:text-base">
              Điều 2. Bàn giao và sử dụng diện tích thuê:
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              2.1. Thời điểm Bên A bàn giao tài sản thuê vào ngày ..
              <span className="text-blue-600">{rentalFrom.getDate()}</span>..
              tháng ..
              <span className="text-blue-600">{rentalFrom.getMonth() + 1}</span>
              .. năm ..
              <span className="text-blue-600">{rentalFrom.getFullYear()}</span>
              ..;
              <br />
              2.2. Bên B được toàn quyền sử dụng tài sản thuê kể từ thời điểm
              được Bên A bàn giao từ thời điểm quy định tại Mục 2.1 trên đây.
            </div>
            <div className="font-bold mb-2 text-[8px] lg:text-base">
              Điều 3. Thời hạn thuê
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              3.1. Bên A cam kết cho Bên B thuê tài sản thuê với thời hạn là ...
              <span className="text-blue-600">{rentalYears}</span>... năm kể từ
              ngày bàn giao Tài sản thuê;
              <br />
              3.2. Hết thời hạn thuê nêu trên nếu bên B có nhu cầu tiếp tục sử
              dụng thì Bên A phải ưu tiên cho Bên B tiếp tục thuê.
            </div>
            <div className="font-bold mb-2 text-[8px] lg:text-base">
              Điều 4. Đặt cọc tiền thuê nhà
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              4.1. Bên B sẽ giao cho Bên A một khoản tiền là ......
              <span className="text-blue-600">{roomDetail?.price}</span>
              ..... VNĐ (bằng chữ: ......
              <span className="text-blue-600">
                {VNnum2words(roomDetail?.price ?? 0)} đồng
              </span>
              ..... ngay sau khi ký hợp đồng này. Số tiền này là tiền đặt cọc để
              đảm bảm thực hiện Hợp đồng cho thuê nhà.
              <br />
              4.2. Nếu Bên B đơn phương chấm dứt hợp đồng mà không thực hiện
              nghĩa vụ báo trước tới Bên A thì Bên A sẽ không phải hoàn trả lại
              Bên B số tiền đặt cọc này.
              <br />
              Nếu Bên A đơn phương chấm dứt hợp đồng mà không thực hiện nghĩa vụ
              báo trước tới bên B thì bên A sẽ phải hoàn trả lại Bên B số tiền
              đặt cọc và phải bồi thường thêm một khoản bằng chính tiền đặt cọc.
              <br />
              4.3. Tiền đặt cọc của Bên B sẽ không được dùng để thanh toán tiền
              thuê. Nếu Bên B vi phạm Hợp Đồng làm phát sinh thiệt hại cho Bên A
              thì Bên A có quyền khấu trừ tiền đặt cọc để bù đắp các chi phí
              khắc phục thiệt hại phát sinh. Mức chi phí bù đắp thiệt hại sẽ
              được Các Bên thống nhất bằng văn bản.
              <br />
            </div>
          </Page>

          {/* Page 3 */}
          <Page number={3}>
            <div className="mb-2 text-[8px] lg:text-base">
              4.4. Vào thời điểm kết thúc thời hạn thuê hoặc kể từ ngày chấm dứt
              Hợp đồng, Bên A sẽ hoàn lại cho Bên B số tiền đặt cọc sau khi đã
              khấu
              <br />
              trừ các khoản tiền mà Bên B phải thanh toán cho Bên A theo quy
              định tại Hợp đồng này.
            </div>
            <div className="font-bold mb-2 text-[8px] lg:text-base">
              Điều 5. Tiền thuê nhà:
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              5.1 Tiền thuê nhà đối với diện tích thuê nêu tại mục 1.1 Điều 1
              là: ......
              <span className="text-blue-600">{roomDetail?.price}</span>
              ..... VNĐ/tháng ...(Bằng chữ:{" "}
              <span className="text-blue-600">
                {VNnum2words(roomDetail?.price ?? 0)} đồng
              </span>
              ... )
              <br />
              5.2 Tiền thuê nhà không bao gồm chi phí khác như tiền điện, nước,
              vệ sinh.... Khoản tiền này sẽ do bên B trả theo khối lượng, công
              suất sử dụng thực tế của Bên B hàng tháng, được tính theo đơn giá
              của nhà nước.
            </div>
            <div className="font-bold mb-2 text-[8px] lg:text-base">
              Điều 6. Phương thức thanh toán tiền thuê nhà
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              Tiền thuê nhà được thanh toán theo 01 (một) tháng/lần vào ngày 05
              (năm) hàng tháng.
              <br />
              Các chi phí khác được bên B tự thanh toán với các cơ quan, đơn vị
              có liên quan khi được yêu cầu.
              <br />
              Việc thanh toán tiền thuê nhà được thực hiện bằng đồng tiền Việt
              Nam theo hình thức trả trực tiếp bằng tiền mặt.
            </div>
            <div className="font-bold mb-2 text-[8px] lg:text-base">
              Điều 7. Quyền và nghĩa vụ của bên cho thuê nhà
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              <b>7.1. Quyền lợi</b>
              <br />- Yêu cầu Bên B thanh toán tiền thuê và chi phí khác đầy đủ,
              đúng hạn theo thoả thuận trong Hợp Đồng;
              <br />- Yêu cầu Bên B phải sửa chữa phần hư hỏng, thiệt hại do lỗi
              của Bên B gây ra.
              <br />
              <b>7.2. Nghĩa vụ</b>
              <br />- Bàn giao diện tích thuê cho Bên B theo đúng thời gian quy
              định trong Hợp đồng;
              <br />- Đảm bảo việc cho thuê theo Hợp đồng này là đúng quy định
              của pháp luật;
              <br />- Đảm bảo cho Bên B thực hiện quyền sử dụng diện tích thuê
              một cách độc lập và liên tục trong suốt thời hạn thuê, trừ trường
              hợp vi phạm
            </div>
          </Page>

          {/* Page 4 */}
          <Page number={4}>
            <div className="text-[8px] lg:text-base">
              pháp luật và/hoặc các quy định của Hợp đồng này.
              <br />- Không xâm phạm trái phép đến tài sản của Bên B trong phần
              diện tích thuê. Nếu Bên A có những hành vi vi phạm gây thiệt hại
              cho Bên B trong thời gian thuê thì Bên A phải bồi thường.
              <br />- Tuân thủ các nghĩa vụ khác theo thoả thuận tại Hợp đồng
              này hoặc/và các văn bản kèm theo Hợp đồng này; hoặc/và theo quy
              định của pháp luật Việt Nam.
            </div>
            <div className="font-bold mb-2 mt-2 text-[8px] lg:text-base">
              Điều 8. Quyền và nghĩa vụ của bên thuê nhà
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              <b>8.1. Quyền lợi</b>
              <br />- Nhận bàn giao diện tích thuê theo đúng thoả thuận trong
              Hợp đồng;
              <br />- Được sử dụng phần diện tích thuê làm nơi ở và các hoạt
              động hợp pháp khác;
              <br />- Yêu cầu Bên A sửa chữa kịp thời những hư hỏng không phải
              do lỗi của Bên B trong phần diện tích thuê để bảo đảm an toàn;
              <br />- Được tháo dỡ và đem ra khỏi phần diện tích thuê các tài
              sản, trang thiết bị của Bên B đã lắp đặt trong phần diện tích thuê
              khi hết thời hạn thuê hoặc đơn phương chấm dứt hợp đồng.
              <br />
              <b>8.2. Nghĩa vụ</b>
              <br />- Sử dụng diện tích thuê đúng mục đích đã thỏa thuận, giữ
              gìn nhà ở và có trách nhiệm trong việc sửa chữa những hư hỏng do
              mình gây ra;
              <br />- Thanh toán tiền đặt cọc, tiền thuê đầy đủ, đúng thời hạn
              đã thỏa thuận;
              <br />- Trả lại diện tích thuê cho Bên A khi hết thời hạn thuê
              hoặc chấm dứt Hợp đồng thuê;
              <br />- Mọi việc sửa chữa, cải tạo, lắp đặt bổ sung các trang
              thiết bị làm ảnh hưởng đến kết cấu của căn phòng…, Bên B phải có
              văn bản thông báo cho Bên A và chỉ được tiến hành các công việc
              này sau khi có sự đồng ý bằng văn bản của Bên A;
              <br />- Tuân thủ một cách chặt chẽ quy định tại Hợp đồng này và
              các quy định của pháp luật Việt Nam.
            </div>
            <div className="font-bold mb-2 text-[8px] lg:text-base">
              Điều 9. Đơn phương chấm dứt hợp đồng thuê nhà:
            </div>
          </Page>

          <Page number={5}>
            <div className="mb-2 text-[8px] lg:text-base">
              Trong trường hợp một trong Hai Bên muốn đơn phương chấm dứt Hợp
              đồng trước hạn thì phải thông báo bằng văn bản cho bên kia trước
              30 (ba mươi) ngày so với ngày mong muốn chấm dứt. Nếu một trong
              Hai Bên không thực hiện nghĩa vụ thông báo cho Bên kia thì sẽ phải
              bồi thường cho bên đó một khoản tiền thuê tương đương với thời
              gian không thông báo và các thiệt hại khác phát sinh do việc chấm
              dứt Hợp đồng trái quy định.
            </div>
            <div className="font-bold mb-2 text-[8px] lg:text-base">
              Điều 10. Điều khoản thi hành
            </div>
            <div className="mb-2 text-[8px] lg:text-base">
              - Hợp đồng này có hiệu lực kể từ ngày hai bên cùng ký kết;
              <br />- Các Bên cam kết thực hiện nghiêm chỉnh và đầy đủ các thoả
              thuận trong Hợp đồng này trên tinh thần hợp tác, thiện chí;
              <br />- Mọi sửa đổi, bổ sung đối với bất kỳ điều khoản nào của Hợp
              đồng phải được lập thành văn bản, có đầy đủ chữ ký của mỗi Bên.
              Văn bản sửa đổi bổ sung Hợp đồng có giá trị pháp lý như Hợp đồng,
              là một phần không tách rời của Hợp đồng này.
              <br />- Hợp đồng được lập thành 02 (hai) bản có giá trị như nhau,
              mỗi Bên giữ 01 (một) bản để thực hiện.
            </div>
            <div className="flex flex-col sm:flex-row justify-between mt-16 gap-8 sm:gap-0">
              <div className="text-center">
                <div className="font-semibold text-[8px] lg:text-base">
                  BÊN CHO THUÊ
                </div>
                <div className="text-[8px] lg:text-base">(Xác nhận)</div>
                {landlordChecked ? (
                  <Checkbox checked={true} />
                ) : (
                  <CustomAlertDialog
                    triggerText={
                      <span>
                        <Checkbox
                          checked={false}
                          disabled={!isLandlord}
                          className="bg-muted-foreground"
                        />
                      </span>
                    }
                    title="Sign the contract?"
                    description="Are you sure you want to sign the contract?"
                    onContinue={handleLandlordSign ?? (() => {})}
                    cancelText="Cancel"
                    continueText="Confirm"
                    triggerClassName="bg-transparent hover:bg-transparent"
                  />
                )}
              </div>
              <div className="text-center">
                <div className="font-semibold text-[8px] lg:text-base">
                  BÊN THUÊ
                </div>
                <div className="text-[8px] lg:text-base">(Xác nhận)</div>
                <Checkbox
                  checked={tenantChecked}
                  onCheckedChange={(checked) =>
                    setTenantChecked && setTenantChecked(!!checked)
                  }
                />
              </div>
            </div>
          </Page>

          {/* End cover */}
          <PageCover>
            <div className="font-bold text-2xl sm:text-3xl text-center">
              HẾT
            </div>
          </PageCover>
        </HTMLFlipBook>
      </div>
      {/* Prev/Next buttons */}
      <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-2 w-full">
        <Button
          className="mt-4 pl-1 pr-3 py-2 rounded w-full sm:w-auto"
          onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
        >
          <ChevronLeft />
          Prev
        </Button>
        <Button
          className="mt-4 pr-1 pl-3 py-2 rounded ml-0 sm:ml-2 w-full sm:w-auto"
          onClick={() => flipBookRef.current?.pageFlip().flipNext()}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default ContractBook;
