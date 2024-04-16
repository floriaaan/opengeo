import { ComponentProps } from "react";

export function CalculatorIcon(props: ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" {...props}>
      <path d="M19.5 2h-15A1.502 1.502 0 003 3.5v17A1.502 1.502 0 004.5 22h15a1.502 1.502 0 001.5-1.5v-17A1.502 1.502 0 0019.5 2zm.5 18.5a.501.501 0 01-.5.5h-15a.501.501 0 01-.5-.5v-17a.501.501 0 01.5-.5h15a.501.501 0 01.5.5zM5 9h14V4H5zm1-4h12v3H6zm2 6H6a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1zm0 3H6v-2h2zm5-3h-2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1zm0 3h-2v-2h2zm0 2h-2a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1zm0 3h-2v-2h2zm-5-3H6a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1zm0 3H6v-2h2zm10-8h-2a1 1 0 00-1 1v7a1 1 0 001 1h2a1 1 0 001-1v-7a1 1 0 00-1-1zm0 8h-2v-7h2z" />
      <path fill="none" d="M0 0h24v24H0z" />
      <script id="bw-fido2-page-script" />
    </svg>
  );
}
