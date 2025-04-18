require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const command = new SlashCommandBuilder()
  .setName('peter')
  .setDescription('Send a secret message to Peter.')
  .addStringOption(option =>
    option
      .setName('message')
      .setDescription('What do you want to say to Peter?')
      .setRequired(true)
  )
  .toJSON();

// Register the slash command globally
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('🌍 Registering global slash command...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [command] }
    );
    console.log('✅ Global command registered! (May take up to 1 hour to appear)');
  } catch (err) {
    console.error('❌ Error registering global command:', err);
  }
})();

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'peter') return;

  const messageText = interaction.options.getString('message');
  const guildName = interaction.guild?.name || 'DM or Unknown Server';
  const channelName = interaction.channel?.name || 'Unknown Channel';
  const owner = await client.users.fetch(process.env.OWNER_ID);

  const summary = 
    `📥 **/peter used**\n` +
    `🌐 Server: ${guildName}\n` +
    `#️⃣ Channel: ${channelName}\n` +
    `💬 Message: ${messageText}`;

  try {
    await owner.send(summary);
    await interaction.deferReply({ ephemeral: true });
  } catch (err) {
    console.error('❌ Failed to DM owner:', err);
    await interaction.reply({
      content: 'Something went wrong while sending the message.',
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
