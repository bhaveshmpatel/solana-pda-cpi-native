use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::{ProgramResult},
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction::create_account
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let iter = &mut accounts.iter();
    
    let payer_account = next_account_info(iter)?;
    let pda_account = next_account_info(iter)?;
    let system_program_account = next_account_info(iter)?;

    // 1. Derive the PDA and check if it matches the account passed in
    let (pda, bump) = Pubkey::find_program_address(
        &[b"client1", payer_account.key.as_ref()],
        program_id,
    );

    if pda != *pda_account.key {
        return Err(ProgramError::InvalidSeeds);
    }

    // 2. Create the instruction
    let ix = create_account(
        payer_account.key,
        pda_account.key,
        1_000_000_000, // 1 SOL
        4,             // space
        program_id,    // The owner should be THIS program, not the system program
    );

    // 3. Define the seeds for signing
    let signer_seeds: &[&[u8]] = &[
        b"client1", 
        payer_account.key.as_ref(), 
        &[bump]
    ];

    // 4. Perform CPI
    // Note: We pass only the relevant account infos needed for create_account
    invoke_signed(
        &ix,
        &[
            payer_account.clone(),
            pda_account.clone(),
            system_program_account.clone(),
        ],
        &[signer_seeds],
    )?;

    Ok(())
}