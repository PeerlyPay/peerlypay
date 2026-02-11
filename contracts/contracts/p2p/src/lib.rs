#![no_std]

mod contract;
mod core {
    pub mod admin;
    pub mod dispute;
    pub mod order;

    pub use admin::*;
    pub use dispute::*;
    pub use order::*;

    pub mod validators {
        pub mod admin;
        pub mod dispute;
        pub mod order;
    }
}
mod error;
mod events {
    pub mod handler;
}

mod storage {
    pub mod types;
}
mod tests {
    #[cfg(test)]
    mod test;
}

pub use crate::contract::P2PContract;
