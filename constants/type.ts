export type Category = {
  id: number;
  name: string;
};

export type Merch = {
  id: number;
  name: string;
  created_at: string;
  ready: boolean;
  merchandise_pictures: {
    picture_url: string;
  }[];
  variants: {
    original_price: number;
    membership_price: number;
  }[];
  shops: {
    id: number;
    acronym: string;
  };
  merchandise_categories: {
    id: number;
    cat_id: number;
  }[];
};

export type FullMerch = {
  id: number;
  name: string;
  created_at: string;
  description: string;
  receiving_information: string;
  online_payment: boolean;
  physical_payment: boolean;
  variant_name: string;
  merchandise_pictures: {
    id: number;
    picture_url: string;
  }[];
  variants: {
    id: number;
    name: string;
    original_price: number;
    membership_price: number;
  }[];
  shops: {
    id: number;
    name: string;
    acronym: string;
    logo_url: string;
  };
};

export type College = {
  id: number;
  name: string;
};

export type Program = {
  id: number;
  name: string;
  college_id: number;
};

export type Profile = {
  id: number;
  first_name: string;
  last_name: string;
  student_number: string;
  contact_number: string;
  college_id: number;
  program_id: number;
  year: number;
  section: number;
};

export type Shop = {
  id: number;
  name?: string;
  acronym?: string;
};

export type ManagedShop = {
  id: number;
  name: string;
  acronym: string;
  logo_url: string;
};

export type Order = {
  id: number;
  quantity: number;
  price: number;
  merchandises: {
    merchandise_pictures: {
      picture_url: string;
    }[];
    name: string;
  };
  variants: {
    name: string;
  };
  order_statuses: {
    paid: boolean;
    received: boolean;
    received_at: string;
    cancelled: boolean;
    cancelled_at: string;
    cancel_reason: string;
  };
  shops: {
    id: number;
    name: string;
    acronym: string;
  };
};

export type FullShopInfo = {
  id: number;
  name: string;
  email: string;
  socmed_url: string;
  logo_url: string;
  college_id?: number | string;
  colleges: {
    id: string;
    name: string;
  };
  acronym: string;
};

export type CartOrder = {
  id: number;
  user_id: string;
  quantity: number;
  variant_id: number;
  merchandises: {
    id: number;
    name: string;
    online_payment: boolean;
    physical_payment: boolean;
    receiving_information: string;
    variant_name: string;
    merchandise_pictures: {
      picture_url: string;
    }[];
    variants: {
      id: number;
      name: string;
      original_price: number;
      membership_price: number;
    }[];
  };
  shops: {
    id: number;
    acronym: string;
    logo_url: string;
  };
};

export type ShopManagementType = {
  id: number;
  name: string;
  email: string;
  socmed_url: string;
  logo_url: string;
  colleges: {
    id: string;
    name: string;
  };
  acronym: string;
};

export type Orders = {
  id: number;
  quantity: number;
  price: number;
  variants: {
    id: number;
    name: string;
  };
  merchandises: {
    name: string;
    merchandise_pictures: {
      picture_url: string;
    }[];
  };
  profiles: {
    student_number: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string;
    section: string;
    year: string;
    colleges: {
      name: string;
    };
    programs: {
      name: string;
    };
  };
  order_statuses: {
    id: number;
    paid: boolean;
    received: boolean;
    received_at?: string;
    cancelled: boolean;
    cancelled_at?: string;
    cancel_reason?: string;
  };
};
