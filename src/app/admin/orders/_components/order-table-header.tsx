

export const OrderTableHeader = () => {
  return (
    <div className="hidden sm:grid grid-cols-5 w-full p-4 border-b text-sm font-medium text-muted-foreground">
      <div>Order ID</div>
      <div>Customer</div>
      <div>Date</div>
      <div className="text-center">Status</div>
      <div className="text-right">Total</div>
      <div></div>
    </div>
  );
};
