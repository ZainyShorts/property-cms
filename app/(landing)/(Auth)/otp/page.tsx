import { Suspense } from "react"
import { OTPComponent } from "./component/otp"

const OTPPageWrapper = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPComponent />
    </Suspense>
  );
}

export default OTPPageWrapper;
