import "./WaitingApproval.css";

function WaitingApproval() {
  return (
    <div className="waiting-page">

      <div className="waiting-box">

        <div className="status-icon">
          ⏳
        </div>

        <h1>
          Registration Under Review
        </h1>

        <p>
          Your restaurant registration
          has been submitted successfully.
        </p>

        <p>
          Our admin team is reviewing
          your application.
        </p>

        <div className="status-badge">
          Status: Pending Approval
        </div>

      </div>

    </div>
  );
}

export default WaitingApproval;