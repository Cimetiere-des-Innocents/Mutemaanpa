# Components

Every entity has certain abilities. For example, a monster in this game has HP, can attack etc. Their abilities are modelled in terms of components.

Components form systems. The interaction between entities are delegated to components, from which they invoke the corresponding game system to update states.

This approach has many advantaged over the Inheritance Chain, which tangles codes together.

## Data model

Entity: An ID, typically a number.

Components: An array of certain data.

