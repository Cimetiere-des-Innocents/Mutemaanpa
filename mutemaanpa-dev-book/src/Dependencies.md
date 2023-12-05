# Dependencies

In this document I will introduce external dependency libraries used in this project. For every library I will explain why I use it and how to use it. Bear in mind that this book will not teach Rust.

## `tracing`: logging library

`tracing` is a logging framework from `tokio`. It enhances the native logging library in concurrency environments. In such environments, logging messages from different threads often get mixed up, which is hard to read and reason.

When you don't want concurrency, `tracing` is no different from the regular logging frameworks. All of logging are two things: record something happened and print it out. In `tracing`, `event` means the former and `subscriber` denotes the latter.

Generally, we can use `tracing`'s shortcut macros, as below:

```rust
use tracing::{debug, error, info, trace, warn};
info!("Hello, world!");
```

You can implement your own `Subscriber`, but for general usage the crate `tracing-subscriber` is adequate.

## `tracing-subscriber`: default logging output

This crate provides a default `Subscriber` implementation, `tracing_subscriber::fmt`.

Initialize the subscriber:

```rust
tracing_subscriber::fmt::init();
```

Note the subscriber is global, so we'd better NOT init it in libraries. We only install them in executables.

## `anyhow`: Error handling

Rust handles error by wrappers. `Option<T>` wraps a nullable value and `Result<T, E>` wraps a value or an error. When we have many error types, the `Result` type is kind of messy. Generally we write:

```rust
fn some_function() -> Result<(), Box<dyn Error>> {
    // ...
    todo!()
}
```

Using `anyhow` we can write:

```rust
fn some_function() -> Result<(), anyhow::Error> {
    // ...
    todo!()
}
```

or,

```rust
fn some_function() -> anyhow::Result<()> {
    // ...
    todo!()
}
```

The last one is preferred to use.

## `serde`: serialization and deserialization

We parse data in lots of places, so we need a serialization and deserialization library.

`serde` has two features. Firstly, it bases on `Derive`, which easier its usage. Secondly, it is format-independent. We use `serde_*` crates to serde specific formats.

A typical usage is:

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Point {
    x: i32,
    y: i32,
}
```
