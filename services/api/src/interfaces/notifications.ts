
type TEmailJob =
    |{ type: "OTP", channel: "EMAIL", to: string; data: { code: string } }
    | {
        type: "RFP_PUBLISHED", channel: "EMAIL", to: string, data: {}
    }
    |{
        type: "RFP_PUBLISHED", channel: "WEBSOCKET", to: string, data: {}
    }
    | {
        type: "PROPOSAL_SUBMITTED", channel: "EMAIL", to: string, data: {}
    }
    |{
        type: "PROPOSAL_SUBMITTED", channel: "WEBSOCKET", to: string, data: {}
    }
