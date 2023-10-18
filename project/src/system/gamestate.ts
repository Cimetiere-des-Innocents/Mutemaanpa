// GameState represents the global state of the game.

class GameState {
    private entities: boolean[] = [];

    // `addEntity` adds an entity to the game state.
    addEntity = (): Entity => (
        this.entities.push(true), this.entities.length - 1
    );
}
