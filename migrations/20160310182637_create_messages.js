exports.up = (knex) => {
  return knex.schema.createTable('messages', table => {
    table.bigincrements('id').primary();
    table.string('user').notNullable();
    table.string('message').notNullable();
    table.string('created_at').notNullable();
    table.string('updated_at').notNullable();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('messages');
};
