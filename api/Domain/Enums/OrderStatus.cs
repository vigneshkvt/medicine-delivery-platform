namespace Medicine.Domain.Enums;

public enum OrderStatus
{
    Pending = 1,
    AwaitingPrescriptionReview = 2,
    Approved = 3,
    Rejected = 4,
    Preparing = 5,
    ReadyForDelivery = 6,
    OutForDelivery = 7,
    Completed = 8,
    Cancelled = 9
}
