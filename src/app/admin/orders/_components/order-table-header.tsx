

export const OrderTableHeader = () => {
    return (
        <div className="w-full grid-cols-2 sm:grid-cols-5 items-center p-4 text-sm font-medium text-muted-foreground bg-muted/40 hidden sm:grid">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Date</div>
            <div className="text-center">Status</div>
            <div className="text-right">Total</div>
            <div className="w-10"></div> {/* Empty div for the dropdown menu icon in the rows */}
        </div>
    );
};
