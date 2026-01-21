from collections import defaultdict
import numpy as np

try:
    from sklearn.linear_model import LinearRegression
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False


def generate_insights(bills):
    grouped = defaultdict(list)
    for bill in bills:
        grouped[bill.service_type].append(bill)

    all_insights = []
    overall_risk = "LOW"

    for service_type, service_bills in grouped.items():
        pending = [b for b in service_bills if b.status == "PENDING"]
        bill_count = len(service_bills)

        if pending:
            all_insights.append(
                f"{service_type}: You have unpaid bills. Clear dues to avoid service disconnection."
            )

        if bill_count >= 2:
            latest = service_bills[-1].amount
            previous = service_bills[-2].amount

            diff = latest - previous
            pct = (diff / previous) * 100 if previous else 0

            if diff > 0:
                all_insights.append(
                    f"{service_type}: Your bill increased by {round(pct, 2)}% compared to last cycle."
                )
            elif diff < 0:
                all_insights.append(
                    f"{service_type}: Good news! Your bill decreased by {abs(round(pct, 2))}% compared to last cycle."
                )
            else:
                all_insights.append(
                    f"{service_type}: Your bill amount is stable compared to last cycle."
                )

        if ML_AVAILABLE and bill_count >= 2:
            try:
                amounts = np.array([b.amount for b in service_bills])
                X = np.arange(bill_count).reshape(-1, 1)

                model = LinearRegression()
                model.fit(X, amounts)

                predicted = model.predict([[bill_count]])[0]

                confidence = "LOW"
                if bill_count >= 3:
                    confidence = "MEDIUM"
                if bill_count >= 5:
                    confidence = "HIGH"

                all_insights.append(
                    f"{service_type}: Next bill estimated around ₹{round(predicted, 2)} "
                    f"(confidence: {confidence})."
                )
            except Exception:
                pass  

        service_risk = "LOW"
        if len(pending) == 1:
            service_risk = "MEDIUM"
        elif len(pending) >= 2:
            service_risk = "HIGH"

        if service_risk == "HIGH":
            overall_risk = "HIGH"
        elif service_risk == "MEDIUM" and overall_risk != "HIGH":
            overall_risk = "MEDIUM"

    return {
        "risk_level": overall_risk,
        "suggestions": all_insights
    }
